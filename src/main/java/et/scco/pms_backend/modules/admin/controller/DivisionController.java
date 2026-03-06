package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.modules.admin.dto.request.DivisionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.DivisionResponseDto;
import et.scco.pms_backend.modules.admin.service.impl.DivisionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/divisions")
public class DivisionController {
    private final DivisionServiceImpl divisionService;

    @GetMapping
    public List<DivisionResponseDto> getDivision(){
        return divisionService.getDivisions();
    }

    @GetMapping("/{id}")
    public DivisionResponseDto getDivision(@PathVariable Long id){
        return divisionService.getDivisionResp(id);
    }

    @PostMapping
    public DivisionResponseDto create(@RequestBody DivisionRequestDto dto){
        return divisionService.createDivision(dto);
    }

    @PutMapping("/{id}")
    public DivisionResponseDto update(@PathVariable Long id, @RequestBody DivisionRequestDto dto){
        return divisionService.updateDivision(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        divisionService.deleteDivision(id);
    }
}
