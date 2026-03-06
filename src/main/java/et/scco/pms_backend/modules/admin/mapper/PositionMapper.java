package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;
import et.scco.pms_backend.modules.admin.model.Division;
import et.scco.pms_backend.modules.admin.model.Position;

import java.util.List;

public class PositionMapper {
    public static PositionResponseDto responseDto(Position position){
        List<Position> children = position.getChildren();
        List<PositionResponseDto.Children> childrenRes;

        if (!children.isEmpty()){
            childrenRes = children.stream()
                    .map(child-> new PositionResponseDto.Children(child.getId(), child.getName()))
                    .toList();
        }else{
            childrenRes = List.of();
        }
        Position parent = position.getParent();
        Division division = position.getDivision();

        return new PositionResponseDto(
          position.getId(),
          position.getName(),
                parent != null ? parent.getId():null,
                parent != null ? parent.getName():null,
          division != null ? division.getId():null,
          division != null ? division.getName():null,
          childrenRes
        );
    }
}
