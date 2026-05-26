package et.scco.pms_backend.modules.mobile;

import et.scco.pms_backend.modules.auth.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/mobile/auth")
@RequiredArgsConstructor
public class MobileLoginController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request, true));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseLoginDto> getProfile() {
        return ResponseEntity.ok(authService.getProfile());
    }
}