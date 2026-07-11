package et.scco.pms_backend.modules.admin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.request.WoredaRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.WoredaResponseDto;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.service.WoredaService;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/admin/subCities")
public class WoredaController {

    private final WoredaService woredaService;

    // @GetMapping("/subCity")
    // public String getSubCity(Long idLong){
    //     return woredaService.getSubCity(null).getSubCityName();
    // }
    @GetMapping("/subCity")
// Use @RequestParam so the URL looks like: /api/admin/subCities/subCity?id=1
public String getSubCity(@RequestParam("id") Long id) {
    SubCity subCity = woredaService.getSubCity(id);
    
    if (subCity == null) {
        return "Unknown Sub-City"; // Or throw a proper exception
    }
    
    return subCity.getSubCityName();
}

    @GetMapping("/woreda")
    public List<WoredaResponseDto> getWoredas(){
        return woredaService.getWoredas();
    }

    @GetMapping("/woreda/{id}")
    public WoredaResponseDto getWoreda(@PathVariable Long id){
        return woredaService.getWoreda(id);
    }

    @PostMapping("/woreda")
    public WoredaResponseDto create(@RequestBody WoredaRequestDto dto){
        return woredaService.createWoreda(dto);
    }

    @PutMapping("/woreda/{id}")
    public WoredaResponseDto update(@PathVariable Long id, @RequestBody WoredaRequestDto dto){
        
        return woredaService.updateWoreda(id, dto);
    }

    @DeleteMapping("/woreda/{id}")
    public void delete(@PathVariable Long id){
        woredaService.deleteById(id);
    }
}
