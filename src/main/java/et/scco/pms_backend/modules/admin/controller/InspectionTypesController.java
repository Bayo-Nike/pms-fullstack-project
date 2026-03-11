package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.request.InspectionTypesRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionTypesResponseDto;
import et.scco.pms_backend.modules.admin.service.InspectionTypesService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inspection-types")
public class InspectionTypesController {

    private final InspectionTypesService inspectionTypesService;

    @PostMapping
    public ApiResponse<Boolean> createInspection(@RequestBody InspectionTypesRequestDto dto){
        return ResponseUtil.success("InspectionType created successfully",
                inspectionTypesService.createInspection(dto));
    }
    @GetMapping
    public ApiResponse<List<InspectionTypesResponseDto>> getAllInspections(){
        return ResponseUtil.success("All inspection", inspectionTypesService.getInspections());
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionTypesResponseDto> getInspection(@PathVariable Long id){
        return ResponseUtil.success("InspectionType found", inspectionTypesService.getInspection(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<InspectionTypesResponseDto> updateInspection(@PathVariable Long id, @RequestBody InspectionTypesRequestDto dto){
        return ResponseUtil.success("InspectionType updated successfully", inspectionTypesService.updateInspection(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInspection(@PathVariable Long id){
        inspectionTypesService.deleteInspection(id);
        return ResponseUtil.success("InspectionType deleted successfully", null);
    }
}
