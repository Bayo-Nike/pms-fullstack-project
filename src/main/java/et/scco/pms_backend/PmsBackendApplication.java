package et.scco.pms_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class PmsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PmsBackendApplication.class, args);
		System.out.println("+++++++++++++++++++++++++++++++++++++++++++");
		System.out.println("Server is ready");
		System.out.println("+++++++++++++++++++++++++++++++++++++++++++");
	}
}
