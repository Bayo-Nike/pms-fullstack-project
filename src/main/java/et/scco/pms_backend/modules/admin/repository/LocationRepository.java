package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    boolean existsByNameAndSubCityId(String name, Long subCityId);
    boolean existsByNameAndSubCityIdAndIdNot(String name, Long subCityId, Long id);
}
