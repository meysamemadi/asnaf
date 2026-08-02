<?php

namespace App\Http\Requests\Admin;

use App\Models\RepairShop;

class UpdateRepairShopRequest extends RepairShopRequest
{
    public function rules(): array
    {
        /** @var RepairShop $repairShop */
        $repairShop = $this->route('repair_shop');

        return $this->repairShopRules(
            $repairShop,
        );
    }
}
