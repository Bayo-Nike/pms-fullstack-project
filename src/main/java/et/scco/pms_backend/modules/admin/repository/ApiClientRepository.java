package et.scco.pms_backend.modules.admin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import et.scco.pms_backend.modules.admin.model.ApiClient;

@Repository
public interface ApiClientRepository extends JpaRepository<ApiClient,Long> {

    boolean existsByClientId(String clientId);

    Optional<ApiClient> findByClientId(String clientId);

    boolean existsByApplicationNameIgnoreCaseAndOrganizationNameIgnoreCase(
            String applicationName,
            String organizationName
    );

    @Query("""
        SELECT DISTINCT a
        FROM ApiClient a
        LEFT JOIN FETCH a.user u
        LEFT JOIN FETCH u.roles
        WHERE a.id = :id
    """)
    Optional<ApiClient> findByIdWithUserAndRoles(
            @Param("id") Long id);

    @Query("""
        SELECT DISTINCT a
        FROM ApiClient a
        LEFT JOIN FETCH a.user u
        LEFT JOIN FETCH u.roles
        ORDER BY a.createdAt DESC
    """)
    List<ApiClient> findAllWithUserAndRoles();

    boolean existsByApplicationNameIgnoreCaseAndOrganizationNameIgnoreCaseAndIdNot(String applicationName,
            String organizationName, Long apiClientId);

}
