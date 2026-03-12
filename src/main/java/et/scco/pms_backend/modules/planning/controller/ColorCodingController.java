package et.scco.pms_backend.modules.planning.controller;
 
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.planning.service.ColorCodingService;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/colorCodes")
public class ColorCodingController {
    private final ColorCodingService colorCodingService;

    // Dynamic Fiscal Year API
    @GetMapping("/fiscal-years")
    public List<String> getFiscalYears() {

        int currentYear = Year.now().getValue();

        List<String> fiscalYears = new ArrayList<>();

        for (int i = -1; i <= 3; i++) { // 1 past, current, 3 future
            int startYear = currentYear + i;
            int endYear = startYear + 1;

            fiscalYears.add(startYear + "/" + endYear);
        }

        return fiscalYears;
    }

     // Build Add Colorcoding REST API
    @PostMapping
    public ApiResponse<ColorCodingResponseDTO> createColorCode(@RequestBody ColorCodingRequestDTO colorCodingRequestDTO) {
        
        ColorCodingResponseDTO savedColorCodingResponseDTO = colorCodingService.createColorCodeTarget(colorCodingRequestDTO);
        return ResponseUtil.success("Color Code created successfully", savedColorCodingResponseDTO);
    }

    // Build Get Colorcoding REST API
    @GetMapping("{id}")
    public ResponseEntity<ColorCodingResponseDTO>getColorCode(@PathVariable("id") Long colorCodeId){
        ColorCodingResponseDTO contractorResponseDTO=colorCodingService.getColorCodeById(colorCodeId);
        return ResponseEntity.ok(contractorResponseDTO);

    }

    // Build Get All ColorCodes REST API
    @GetMapping
    public ResponseEntity<List<ColorCodingResponseDTO>>getAllColorCodes(){
        List<ColorCodingResponseDTO> allColorCodesDto=colorCodingService.getAllColorCodes();
        return ResponseEntity.ok(allColorCodesDto);

    }
 

    // Build Update ColorCode REST API
    @PutMapping("/{id}")
    public ResponseEntity<ColorCodingResponseDTO>updateColorCode(@PathVariable("id") Long contractorId,@RequestBody ColorCodingRequestDTO colorCodingRequestDTO){
        ColorCodingResponseDTO colorCodingResponseDTO =colorCodingService.updateColorCode(contractorId,colorCodingRequestDTO);
        return ResponseEntity.ok(colorCodingResponseDTO);
    }
    // Build Delete ColorCode REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteColorCode(@PathVariable("id") Long colorCodeId){
        colorCodingService.deleteColorCode(colorCodeId);
        return ResponseEntity.ok("ColorCode deleted successfully.");
    }

}
