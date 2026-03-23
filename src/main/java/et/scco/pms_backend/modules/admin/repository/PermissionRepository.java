package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.admin.model.Permission;

import java.util.Collection;
import java.util.List;

public interface PermissionRepository extends JpaRepository <Permission, Long>{
    boolean existsBySlug(String slug);

    List<Permission> findAllBySlugIn(List<String> names);
}
