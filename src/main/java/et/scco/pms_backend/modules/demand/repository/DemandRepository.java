package et.scco.pms_backend.modules.demand.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import et.scco.pms_backend.enums.DemandStatus;
import et.scco.pms_backend.modules.demand.model.Demand;

public interface DemandRepository extends JpaRepository<Demand,Long>, JpaSpecificationExecutor<Demand>{

    @Query("SELECT COUNT(d) FROM Demand d WHERE d.status = :status")
    long countDemandByStatus(@Param("status") DemandStatus status);

    @Query("""
        SELECT COUNT(d)
        FROM Demand d
        WHERE d.status = :status
            AND d.client.id = :clientId
        """)
    long countDemandByClientIdAndStatus(
            @Param("status") DemandStatus status,
            @Param("clientId") Long clientId
    );

}
