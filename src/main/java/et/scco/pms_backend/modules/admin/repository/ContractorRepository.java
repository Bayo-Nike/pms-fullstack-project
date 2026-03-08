package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import et.scco.pms_backend.modules.admin.model.Contractor;

@Repository
public interface ContractorRepository extends JpaRepository <Contractor, Long>{

}
