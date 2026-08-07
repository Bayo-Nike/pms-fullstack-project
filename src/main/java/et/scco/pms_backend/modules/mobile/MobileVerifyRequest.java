package et.scco.pms_backend.modules.mobile;

import lombok.Data;

@Data
public class MobileVerifyRequest {

    private String userCode;

    private String deviceInfo; // e.g., "Android 13, Pixel 6, UUID: 550e8400..."
}