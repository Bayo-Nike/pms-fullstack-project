package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.request.MobileUserRequestDto;
import et.scco.pms_backend.modules.admin.dto.request.MobileVerifyRequest;
import et.scco.pms_backend.modules.admin.dto.response.MobileUserResponseDto;
import et.scco.pms_backend.modules.auth.AuthResponseDto;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MobileUserService {
    MobileUserResponseDto registerMobileUser(MobileUserRequestDto dto);
    List<MobileUserResponseDto> getAllMobileUsers();
    MobileUserResponseDto updateStatus(Long id, String status);
    void deleteMobileUser(Long id);

    @Transactional
    AuthResponseDto verifyMobileCode(MobileVerifyRequest request);
}