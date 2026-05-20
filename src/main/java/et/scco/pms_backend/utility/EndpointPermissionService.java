package et.scco.pms_backend.utility;

import et.scco.pms_backend.config.EndpointPermissionConfig;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import java.util.List;

@Service
public class EndpointPermissionService {

    private final List<EndpointPermission> mappings =
            EndpointPermissionConfig.MAPPINGS;

    private final AntPathMatcher pathMatcher =
            new AntPathMatcher();

    public EndpointPermission getRequiredPermission(String method,
                                                    String requestPath) {

        for (EndpointPermission ep : mappings) {

            if (!ep.getMethod().equalsIgnoreCase(method)) {
                continue;
            }

            if (pathMatcher.match(ep.getPath(), requestPath)) {
                return ep;
            }
        }

        return null;
    }
}