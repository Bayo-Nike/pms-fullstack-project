package et.scco.pms_backend.modules.auth;

import lombok.RequiredArgsConstructor;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import et.scco.pms_backend.utility.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // @PostMapping("/login")
    // public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
    //     return ResponseEntity.ok(authService.login(request, false));
    // }

    // @PostMapping("/login")
    // public ResponseEntity<AuthResponseDto> login(
    //         @RequestBody LoginRequestDto request
    // ) {

    //     AuthResponseDto response =
    //             authService.login(request, false);

    //     Authentication authentication =
    //             SecurityContextHolder.getContext()
    //                     .getAuthentication();

    //     String token =
    //             jwtService.generateToken(authentication);

    //     ResponseCookie cookie = ResponseCookie.from(
    //                     "access_token",
    //                     token
    //             )
    //             .httpOnly(true)
    //             .secure(false) // localhost only. When the application is in Production i.e HTTPS: make .secure(true)
    //             .sameSite("Lax")
    //             .path("/")
    //             .maxAge(Duration.ofMinutes(15))
    //             .build();

    //     return ResponseEntity.ok()
    //             .header(
    //                     HttpHeaders.SET_COOKIE,
    //                     cookie.toString()
    //             )
    //             .body(response);
    // }

    @PostMapping("/login")
    public ResponseEntity<WebAuthResponseDto> login(
            @RequestBody LoginRequestDto request
    ) {

        AuthResponseDto authResponse =
                authService.login(request, false);

        ResponseCookie cookie = ResponseCookie
                .from(
                        "access_token",
                        authResponse.getAccessToken()
                )
                .httpOnly(true)
                .secure(false) // for localhost only. When you deploy to HTTPS (in Production), change to: .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .build();

        WebAuthResponseDto response =
                new WebAuthResponseDto(
                        authResponse.getUser()
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookie.toString()
                )
                .body(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseLoginDto> getProfile() {
        return ResponseEntity.ok(authService.getProfile());
    }

    // @PostMapping("/logout")
    // public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
    //     authService.logout(token);
    //     return ResponseEntity.ok().build();
    // }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {

        String jwt = null;

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {

                if ("access_token".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        authService.logout(jwt);

        ResponseCookie deleteCookie = ResponseCookie
                .from("access_token", "")
                .httpOnly(true)
                .secure(false) // for localhost only. When you deploy to HTTPS (in Production), change to: .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        deleteCookie.toString()
                )
                .build();
    }

    @PutMapping("/change-password")
    public ResponseEntity<Boolean> changePassword(@RequestBody ChangePasswordRequestDto dto){
        return ResponseEntity.ok(
                authService.changePassword(dto)
        );
    }
}