<?php

namespace App\Http\Requests\Admin;

class StoreRepairShopRequest extends RepairShopRequest
{
    public function rules(): array
    {
        return $this->repairShopRules();
    }
}
