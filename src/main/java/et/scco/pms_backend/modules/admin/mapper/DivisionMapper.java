package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.modules.admin.dto.response.DivisionResponseDto;
import et.scco.pms_backend.modules.admin.model.Division;

import java.util.List;

public class DivisionMapper {

    public static DivisionResponseDto responseDto(Division division)
    {
        List<Division>children = division.getChildren();
        List<DivisionResponseDto.Children> childrenRes;

        if (!children.isEmpty()){
            childrenRes = children.stream()
                    .map(child -> new DivisionResponseDto.Children(child.getId(), child.getName()))
                    .toList();
        } else {
            childrenRes = List.of();
        }

        Division parent = division.getParent();

        return new DivisionResponseDto(
                division.getId(),
                division.getName(),
                parent != null ? parent.getId():null,
                parent != null ? parent.getName():null,
                childrenRes
        );
    }
}
