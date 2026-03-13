package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.request.MobileUserRequestDto;
import et.scco.pms_backend.modules.admin.dto.request.MobileVerifyRequest;
import et.scco.pms_backend.modules.admin.dto.response.MobileUserResponseDto;
import et.scco.pms_backend.modules.admin.service.MobileUserService;
import et.scco.pms_backend.modules.auth.AuthResponseDto;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/mobile-users")
@RequiredArgsConstructor
public class MobileUserController {

    private final MobileUserService mobileUserService;

    @PostMapping
    public ApiResponse<MobileUserResponseDto> register(@RequestBody MobileUserRequestDto dto) {
        return ResponseUtil.success(
                "Mobile access granted successfully",
                mobileUserService.registerMobileUser(dto)
        );
    }

    @GetMapping
    public ApiResponse<List<MobileUserResponseDto>> getAll() {
        return ResponseUtil.success(
                "Mobile registry fetched successfully",
                mobileUserService.getAllMobileUsers()
        );
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<MobileUserResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseUtil.success(
                "Device status updated",
                mobileUserService.updateStatus(id, status)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mobileUserService.deleteMobileUser(id);
        return ResponseUtil.success("Device registration removed", null);
    }


    @PostMapping("/verify")
    public ApiResponse<AuthResponseDto> verify(@RequestBody MobileVerifyRequest request) {
        return ResponseUtil.success(
                "Device paired successfully",
                mobileUserService.verifyMobileCode(request)
        );
    }

}