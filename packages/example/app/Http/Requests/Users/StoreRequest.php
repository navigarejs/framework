<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
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
      'email' => ['required', 'max:50', 'email', Rule::unique('users')],
      'password' => ['nullable'],
      'owner' => ['required', 'boolean'],
      'photo' => ['nullable', 'image'],
    ];
  }
}
