<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request,
    ): array {
        return [
            'id' => $this->id,

            'name' => $this->name,

            'slug' => $this->slug,

            'code' => $this->code,

            'latitude' =>
                $this->latitude !== null
                    ? (float) $this->latitude
                    : null,

            'longitude' =>
                $this->longitude !== null
                    ? (float) $this->longitude
                    : null,

            'map_zoom' =>
                (int) $this->map_zoom,
        ];
    }
}
