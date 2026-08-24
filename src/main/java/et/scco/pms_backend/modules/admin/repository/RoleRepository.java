package et.scco.pms_backend.modules.admin.repository;
 
import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.admin.model.Roles;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository <Roles, Long> {

    Optional<Roles> findByRoleName(String roleName);
    @Query("""
       SELECT CASE WHEN COUNT(u) > 0 THEN TRUE ELSE FALSE END
       FROM User u JOIN u.roles r
       WHERE r.id = :roleId
       """)
    boolean isRoleUsed(@Param("roleId") Long roleId);
}
