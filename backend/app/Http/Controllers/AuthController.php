<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function session(User $user): array
    {
        return [
            'access_token' => $user->createToken('mobile', ['*'], now()->addDays(30))->plainTextToken,
            'user' => $user,
        ];
    }

    public function register(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'string', PasswordRule::min(8), 'max:72'],
        ]);
        return response()->json(DB::transaction(fn () => $this->session(User::create($data))), 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Correo o contraseña incorrectos.']);
        }
        return $this->session($user);
    }

    public function me(Request $request) { return $request->user(); }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }

    public function update(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100']);
        $request->user()->update($data);
        return $request->user()->fresh();
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', 'string', PasswordRule::min(8), 'max:72'],
        ]);
        $user = $request->user();
        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'La contraseña actual es incorrecta.']);
        }
        DB::transaction(function () use ($user, $data) {
            $user->update(['password' => $data['password']]);
            $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        });
        return response()->noContent();
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);
        Password::sendResetLink(['email' => strtolower(trim($data['email']))]);
        return ['message' => 'Si la cuenta existe, recibirás un enlace para restablecer tu contraseña.'];
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', 'string', PasswordRule::min(8), 'max:72'],
        ]);
        $status = Password::reset($data, function (User $user, string $password) {
            DB::transaction(function () use ($user, $password) {
                $user->forceFill(['password' => $password, 'remember_token' => \Illuminate\Support\Str::random(60)])->save();
                $user->tokens()->delete();
            });
        });
        if ($status !== Password::PASSWORD_RESET) {
            return back()->withErrors(['email' => 'El enlace no es válido o ha expirado. Solicita otro desde la app.']);
        }
        return redirect()->route('password.done');
    }
}
