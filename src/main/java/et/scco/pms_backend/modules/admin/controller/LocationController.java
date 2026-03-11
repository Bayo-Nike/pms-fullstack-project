package et.scco.pms_backend.modules.admin.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.request.LocationRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.LocationResponseDTO;
import et.scco.pms_backend.modules.admin.service.impl.LocationServiceImpl;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/locations")
public class LocationController {

    private final LocationServiceImpl locationService;

    @GetMapping
    public ApiResponse<List<LocationResponseDTO>> getLocations() {
        return ResponseUtil.success("Locations fetched successfully",
                locationService.getLocations());
    }

    @GetMapping("/{id}")
    public ApiResponse<LocationResponseDTO> getLocation(@PathVariable Long id) {
        return ResponseUtil.success("Location fetched successfully",
                locationService.getLocation(id));
    }

    @PostMapping
    public ApiResponse<LocationResponseDTO> createLocation(
            @RequestBody LocationRequestDTO dto) {

        return ResponseUtil.success("Location created successfully",
                locationService.createLocation(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<LocationResponseDTO> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationRequestDTO dto) {

        return ResponseUtil.success("Location updated successfully",
                locationService.updateLocation(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseUtil.success("Location deleted successfully", null);
    }
}