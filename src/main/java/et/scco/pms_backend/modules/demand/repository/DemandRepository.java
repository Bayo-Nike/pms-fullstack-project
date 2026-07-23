package et.scco.pms_backend.modules.demand.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import et.scco.pms_backend.modules.demand.model.Demand;

public interface DemandRepository extends JpaRepository<Demand,Long>, JpaSpecificationExecutor<Demand>{

}
