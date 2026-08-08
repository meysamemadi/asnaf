<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * تبدیل دسته‌بندی به خروجی عمومی API.
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request,
    ): array {
        return [
            'id' => $this->id,

            'parent_id' =>
                $this->parent_id,

            'name' =>
                $this->name,

            'slug' =>
                $this->slug,

            'description' =>
                $this->description,

            'icon' => [
                'library' =>
                    $this->icon_library,

                'name' =>
                    $this->icon,
            ],

            'sort_order' =>
                $this->sort_order,

            /*
             * در API عمومی فقط رکوردهای فعال
             * برگردانده می‌شوند، ولی وجود این
             * مقدار قرارداد API را شفاف‌تر می‌کند.
             */
            'is_active' =>
                $this->is_active,

            'parent' =>
                $this->whenLoaded(
                    'parent',
                    function (): ?array {
                        if (
                            !$this->parent ||
                            !$this->parent->is_active
                        ) {
                            return null;
                        }

                        return [
                            'id' =>
                                $this->parent->id,

                            'name' =>
                                $this->parent->name,

                            'slug' =>
                                $this->parent->slug,
                        ];
                    },
                ),

            /*
             * برای index یک درخت کامل ساخته می‌شود.
             */
            'children' =>
                CategoryResource::collection(
                    $this->whenLoaded(
                        'activeChildrenRecursive',
                    ),
                ),
        ];
    }
}
