package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.admin.model.Client;

public interface ClientRepository extends JpaRepository<Client,Long>{

}
