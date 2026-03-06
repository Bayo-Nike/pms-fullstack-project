package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {
    Optional<Division> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
