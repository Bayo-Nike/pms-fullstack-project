package et.scco.pms_backend.modules.admin.controller;


import et.scco.pms_backend.modules.admin.dto.request.PositionRequestDto;
import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;
import et.scco.pms_backend.modules.admin.service.impl.PositionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/positions")
public class PositionController {

    private final PositionServiceImpl positionService;

    @GetMapping
    public List<PositionResponseDto> getPositions(){
        return positionService.getPositions();
    }

    @GetMapping("/{id}")
    public PositionResponseDto getPosition(@PathVariable String id){
        return positionService.getPosition(Long.parseLong(id));
    }

    @PostMapping
    public PositionResponseDto createPosition(@RequestBody PositionRequestDto dto){
        return positionService.createPosition(dto);
    }

    @PutMapping("/{id}")
    public PositionResponseDto updatePosition(@PathVariable Long id, @RequestBody PositionResponseDto dto){
        return positionService.updatePosition(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletePosition(@PathVariable String id){
        positionService.deletePosition(id);
    }
}
