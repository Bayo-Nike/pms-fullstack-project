package et.scco.pms_backend.modules.demand.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.demand.model.DemandDocument;

public interface DemandDocumentRepository extends JpaRepository <DemandDocument, Long>{

}
