package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.modules.admin.dto.request.CreateSubCityRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.model.City;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/cities")
public class SubCityController {

    private final SubCityServiceImpl subCityService;

    @GetMapping("/city")
    public City getCity(){
        return subCityService.getCity();
    }

    @GetMapping("/sub")
    public List<SubCityResponseDto> getSubCities(){
        return subCityService.getSubCities();
    }

    @GetMapping("/sub/{id}")
    public SubCityResponseDto getSubCity(@PathVariable Long id){
        return subCityService.getSubCity(id);
    }

    @PostMapping("/sub")
    public SubCityResponseDto create(@RequestBody CreateSubCityRequestDto dto){
        return subCityService.createSubCity(dto);
    }

    @PutMapping("/sub/{id}")
    public SubCityResponseDto update(@PathVariable Long id, @RequestBody CreateSubCityRequestDto dto){
        return subCityService.updateSubCity(id, dto);
    }

    @DeleteMapping("/sub/{id}")
    public void delete(@PathVariable Long id){
        subCityService.deleteSubCity(id);
    }
}
