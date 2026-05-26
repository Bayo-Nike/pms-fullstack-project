package et.scco.pms_backend.modules.mobile;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.auth.AuthResponseDto;
import et.scco.pms_backend.modules.auth.AuthService;
import et.scco.pms_backend.modules.auth.UserResponseLoginDto;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/mobile")
@RequiredArgsConstructor
public class MobileUserController {

    private final MobileUserService mobileUserService;
    private final AuthService authService;

    @PostMapping("/verify")
    public ApiResponse<AuthResponseDto> verify(@RequestBody MobileVerifyRequest request) {
        return ResponseUtil.success(
                "Device paired successfully",
                mobileUserService.verifyMobileCode(request)
        );
    }
    @GetMapping("/profile")
    public ResponseEntity<UserResponseLoginDto> getMobileProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String username = auth.getName();
        return ResponseEntity.ok(authService.getProfile());
    }
}
