package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.request.InspectionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.InspectionResponseDto;
import et.scco.pms_backend.modules.admin.service.InspectionService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inspections")
public class InspectionController {

    private final InspectionService inspectionService;

    @PostMapping
    public ApiResponse<Boolean> createInspection(@RequestBody InspectionRequestDto dto){
        return ResponseUtil.success("Inspection created successfully",
                inspectionService.createInspection(dto));
    }
    @GetMapping
    public ApiResponse<List<InspectionResponseDto>> getAllInspections(){
        return ResponseUtil.success("All inspection", inspectionService.getInspections());
    }

    @GetMapping("/{id}")
    public ApiResponse<InspectionResponseDto> getInspection(@PathVariable Long id){
        return ResponseUtil.success("Inspection found", inspectionService.getInspection(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<InspectionResponseDto> updateInspection(@PathVariable Long id, @RequestBody InspectionRequestDto dto){
        return ResponseUtil.success("Inspection updated successfully", inspectionService.updateInspection(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInspection(@PathVariable Long id){
        inspectionService.deleteInspection(id);
        return ResponseUtil.success("Inspection deleted successfully", null);
    }
}
