<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateRequest extends FormRequest
{
  /**
   * Get the validation rules that apply to the request.
   *
   * @return array
   */
  public function rules()
  {
    return [
      'first_name' => ['required', 'max:50'],
      'last_name' => ['required', 'max:50'],
      'email' => [
        'required',
        'max:50',
        'email',
        Rule::unique('users')->ignore($this->user->id),
      ],
      'password' => ['nullable'],
      'owner' => ['required', 'boolean'],
      'photo' => ['nullable', 'image'],
    ];
  }
}
