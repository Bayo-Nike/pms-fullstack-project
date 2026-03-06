package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import et.scco.pms_backend.modules.admin.model.Module;

import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository <Module, Long>{
    boolean existsByNameIgnoreCase(String name);
    Optional<Module> findByNameIgnoreCase(String name);
}
