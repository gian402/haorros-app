<?php

namespace Tests\Feature;

use App\Models\{Expense, Goal, GoalMember, Loan, Transaction, User};
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{DB, Hash, Notification, Password, Storage};
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SavingsApiTest extends TestCase
{
    use RefreshDatabase;

    private function goal(User $owner): Goal
    {
        return Goal::create(['owner_id' => $owner->id, 'title' => 'Viaje', 'target_amount' => 100]);
    }

    public function test_registration_login_and_logout_use_real_bearer_tokens(): void
    {
        $data = ['name' => 'Ana', 'email' => 'ANA@example.com', 'password' => 'password123'];
        $registered = $this->postJson('/api/auth/register', $data)->assertCreated()->assertJsonMissingPath('user.password');
        $this->assertTrue(Hash::check('password123', User::first()->password));
        $this->assertSame('ana@example.com', User::first()->email);
        $token = $registered->json('access_token');
        $this->withToken($token)->getJson('/api/auth/me')->assertOk()->assertJsonPath('name', 'Ana');
        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => 'ana@example.com', 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => 'ana@example.com', 'password' => 'password123'])->assertOk();
    }

    public function test_private_routes_require_authentication(): void
    {
        foreach (['goals', 'expenses', 'loans', 'auth/me'] as $path) $this->getJson('/api/'.$path)->assertUnauthorized();
    }

    public function test_goal_owner_cannot_be_spoofed_and_strangers_are_blocked(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        Sanctum::actingAs($owner);
        $created = $this->postJson('/api/goals', [
            'title' => 'Casa', 'target_amount' => 100, 'owner_id' => $stranger->id,
            'current_amount' => 999, 'image_url' => 'https://untrusted.test/x',
        ])->assertCreated()->assertJsonPath('owner_id', $owner->id)->assertJsonPath('current_amount', 0);
        $id = $created->json('id');
        Sanctum::actingAs($stranger);
        $this->getJson('/api/goals')->assertExactJson([]);
        $this->getJson('/api/goals/'.$id)->assertForbidden();
        $this->patchJson('/api/goals/'.$id, ['title' => 'No'])->assertForbidden();
        $this->deleteJson('/api/goals/'.$id)->assertForbidden();
        $this->getJson('/api/goals/'.$id.'/transactions')->assertForbidden();
        $this->postJson('/api/goals/'.$id.'/transactions', ['amount' => 1, 'request_id' => Str::uuid()->toString()])->assertForbidden();
    }

    public function test_members_can_contribute_but_cannot_manage_the_goal(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $goal = $this->goal($owner);
        Sanctum::actingAs($owner);
        $id = $this->postJson('/api/goals/'.$goal->id.'/members', ['email' => $member->email])->assertCreated()->json('id');
        $this->postJson('/api/goals/'.$goal->id.'/members', ['email' => $member->email])->assertOk();
        $this->assertDatabaseCount('goal_members', 1);
        Sanctum::actingAs($member);
        $this->getJson('/api/goals')->assertJsonCount(1);
        $this->getJson('/api/goals/'.$goal->id)->assertOk()->assertJsonCount(1, 'members');
        $this->patchJson('/api/goals/'.$goal->id, ['title' => 'No'])->assertForbidden();
        $this->deleteJson('/api/goals/'.$goal->id)->assertForbidden();
        $this->deleteJson('/api/members/'.$id)->assertForbidden();
        $this->postJson('/api/goals/'.$goal->id.'/members', ['email' => $owner->email])->assertForbidden();
        $this->postJson('/api/goals/'.$goal->id.'/transactions', [
            'amount' => 12.34, 'request_id' => Str::uuid()->toString(), 'user_id' => $owner->id,
        ])->assertCreated()->assertJsonPath('user_id', $member->id)->assertJsonPath('amount', 12.34);
        Sanctum::actingAs($owner);
        $this->deleteJson('/api/members/'.$id)->assertNoContent();
        Sanctum::actingAs($member);
        $this->getJson('/api/goals/'.$goal->id)->assertForbidden();
    }

    public function test_deposits_are_idempotent_and_validate_cents_and_remaining_amount(): void
    {
        $owner = User::factory()->create();
        $goal = $this->goal($owner);
        Sanctum::actingAs($owner);
        $payload = ['amount' => 10.25, 'request_id' => Str::uuid()->toString()];
        $first = $this->postJson('/api/goals/'.$goal->id.'/transactions', $payload)->assertCreated();
        $this->postJson('/api/goals/'.$goal->id.'/transactions', $payload)->assertCreated()->assertJsonPath('id', $first->json('id'));
        $this->assertDatabaseCount('transactions', 1);
        $this->assertEquals(10.25, $goal->fresh()->current_amount);
        $this->postJson('/api/goals/'.$goal->id.'/transactions', [...$payload, 'amount' => 11])->assertConflict();
        foreach ([-1, 0, 0.001, 90] as $amount) {
            $this->postJson('/api/goals/'.$goal->id.'/transactions', [
                'amount' => $amount, 'request_id' => Str::uuid()->toString(),
            ])->assertUnprocessable();
        }
        $this->patchJson('/api/goals/'.$goal->id, ['target_amount' => 10])->assertUnprocessable();
        $this->assertEquals(10.25, $goal->fresh()->current_amount);
        $this->postJson('/api/goals/'.$goal->id.'/transactions', [
            'amount' => 89.75, 'request_id' => Str::uuid()->toString(),
        ])->assertCreated();
        $this->assertEquals(100, $goal->fresh()->current_amount);
    }

    public function test_deposit_rolls_back_if_updating_the_balance_fails(): void
    {
        $owner = User::factory()->create();
        $goal = $this->goal($owner);
        Sanctum::actingAs($owner);
        Goal::updating(fn () => throw new \RuntimeException('Simulated failure'));
        try {
            $this->postJson('/api/goals/'.$goal->id.'/transactions', [
                'amount' => 10, 'request_id' => Str::uuid()->toString(),
            ])->assertServerError();
            $this->assertDatabaseCount('transactions', 0);
            $this->assertEquals(0, $goal->fresh()->current_amount);
        } finally { Goal::flushEventListeners(); }
    }

    public function test_expenses_and_loans_are_private_and_ignore_spoofed_user_ids(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        Sanctum::actingAs($owner);
        $expense = $this->postJson('/api/expenses', [
            'description' => 'Comida', 'amount' => 1.25, 'user_id' => $stranger->id,
        ])->assertCreated()->assertJsonPath('user_id', $owner->id)->json('id');
        $loan = $this->postJson('/api/loans', [
            'description' => 'Préstamo', 'amount' => 5, 'user_id' => $stranger->id,
        ])->assertCreated()->assertJsonPath('paid', false)->json('id');
        $this->patchJson('/api/loans/'.$loan.'/paid')->assertOk()->assertJsonPath('paid', true);
        Sanctum::actingAs($stranger);
        $this->getJson('/api/expenses')->assertExactJson([]);
        $this->getJson('/api/loans')->assertExactJson([]);
        $this->deleteJson('/api/expenses/'.$expense)->assertForbidden();
        $this->deleteJson('/api/loans/'.$loan)->assertForbidden();
        $this->patchJson('/api/loans/'.$loan.'/paid')->assertForbidden();
        Sanctum::actingAs($owner);
        $this->deleteJson('/api/expenses/'.$expense)->assertNoContent();
        $this->deleteJson('/api/loans/'.$loan)->assertNoContent();
    }

    public function test_images_validate_content_and_goal_ownership(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $goal = $this->goal($owner);
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/goals/'.$goal->id.'/image', ['file' => UploadedFile::fake()->image('x.jpg')])->assertForbidden();
        Sanctum::actingAs($owner);
        $this->postJson('/api/auth/avatar', ['file' => UploadedFile::fake()->create('x.php', 1, 'text/plain')])->assertUnprocessable();
        $response = $this->postJson('/api/goals/'.$goal->id.'/image', ['file' => UploadedFile::fake()->image('x.jpg')])->assertOk();
        $this->get($response->json('image_url'))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->postJson('/api/auth/avatar', ['file' => UploadedFile::fake()->image('a.png')])->assertOk()->assertJsonStructure(['avatar_url']);
    }

    public function test_password_reset_sends_a_working_link_and_revokes_sessions(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $user->createToken('phone');
        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();
        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;
            return true;
        });
        $this->get('/reset-password/'.$token.'?email='.urlencode($user->email))->assertOk()->assertSee('Nueva contraseña');
        $this->post('/reset-password', [
            'token' => $token, 'email' => $user->email,
            'password' => 'newpassword123', 'password_confirmation' => 'newpassword123',
        ])->assertRedirect('/password-updated');
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->post('/reset-password', [
            'token' => $token, 'email' => $user->email,
            'password' => 'otherpassword123', 'password_confirmation' => 'otherpassword123',
        ])->assertSessionHasErrors('email');
        $this->postJson('/api/auth/forgot-password', ['email' => 'missing@example.com'])->assertOk();
    }

    public function test_password_change_requires_current_password_and_preserves_only_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('current')->plainTextToken;
        $user->createToken('other');
        $this->withToken($token)->postJson('/api/auth/password', [
            'current_password' => 'wrong', 'password' => 'newpassword123', 'password_confirmation' => 'newpassword123',
        ])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/auth/password', [
            'current_password' => 'password', 'password' => 'newpassword123', 'password_confirmation' => 'newpassword123',
        ])->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_deleting_goal_cascades_members_and_transactions(): void
    {
        $owner = User::factory()->create();
        $goal = $this->goal($owner);
        $goal->members()->create(['user_id' => User::factory()->create()->id]);
        Sanctum::actingAs($owner);
        $this->postJson('/api/goals/'.$goal->id.'/transactions', [
            'amount' => 10, 'request_id' => Str::uuid()->toString(),
        ])->assertCreated();
        $this->deleteJson('/api/goals/'.$goal->id)->assertNoContent();
        $this->assertDatabaseCount('goal_members', 0);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_expired_tokens_are_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('expired', ['*'], now()->subDay())->plainTextToken;
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }
}
