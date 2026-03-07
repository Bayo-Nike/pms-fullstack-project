package et.scco.pms_backend.utility;

import et.scco.pms_backend.config.ApiResponse;

public class ResponseUtil {

    public static <T> ApiResponse<T> success(String message, T data){
        return new ApiResponse<>(true, message, data);
    }

    public static ApiResponse<Void> error(String message){
        return new ApiResponse<>(false, message, null);
    }
}