<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $id = $request->user()->id;
        return Goal::where(fn ($q) => $q->where('owner_id', $id)->orWhereHas('members', fn ($m) => $m->where('user_id', $id)))
            ->with('members.user')->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'target_amount' => 'required|numeric|decimal:0,2|min:0.01|max:9999999999.99',
            'category' => 'nullable|string|max:100',
            'deadline' => 'nullable|date_format:Y-m-d',
        ]);
        $goal = Goal::create([...$data, 'owner_id' => $request->user()->id]);
        return response()->json($goal->fresh()->load('members.user'), 201);
    }

    public function show(Request $request, Goal $goal)
    {
        abort_unless($goal->canAccess($request->user()), 403);
        return $goal->load('members.user');
    }

    public function update(Request $request, Goal $goal)
    {
        abort_unless($goal->owner_id === $request->user()->id, 403);
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'target_amount' => 'sometimes|required|numeric|decimal:0,2|min:0.01|max:9999999999.99',
        ]);
        return DB::transaction(function () use ($goal, $data) {
            $locked = Goal::whereKey($goal->id)->lockForUpdate()->firstOrFail();
            if (isset($data['target_amount']) && $data['target_amount'] < $locked->current_amount) {
                throw ValidationException::withMessages(['target_amount' => 'La meta no puede ser menor que el ahorro acumulado.']);
            }
            $locked->update($data);
            return $locked->load('members.user');
        });
    }

    public function destroy(Request $request, Goal $goal)
    {
        abort_unless($goal->owner_id === $request->user()->id, 403);
        $goal->delete();
        return response()->noContent();
    }

    public function addMember(Request $request, Goal $goal)
    {
        abort_unless($goal->owner_id === $request->user()->id, 403);
        $data = $request->validate(['email' => 'required|email']);
        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (!$user) throw ValidationException::withMessages(['email' => 'Usuario no encontrado. Debe registrarse primero.']);
        if ($user->id === $goal->owner_id) {
            throw ValidationException::withMessages(['email' => 'Ya eres el propietario de esta meta.']);
        }
        return $goal->members()->firstOrCreate(['user_id' => $user->id])->load('user');
    }

    public function removeMember(Request $request, GoalMember $member)
    {
        abort_unless($member->goal->owner_id === $request->user()->id, 403);
        $member->delete();
        return response()->noContent();
    }
}
