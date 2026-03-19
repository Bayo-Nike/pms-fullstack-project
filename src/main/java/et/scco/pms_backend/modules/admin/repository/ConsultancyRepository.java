package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.admin.model.Consultancy;

public interface ConsultancyRepository  extends JpaRepository<Consultancy, Long>{

}
