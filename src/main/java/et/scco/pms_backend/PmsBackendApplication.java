package et.scco.pms_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PmsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PmsBackendApplication.class, args);
		System.out.println("+++++++++++++++++++++++++++++++++++++++++++");
		System.out.println("Server is ready");
		System.out.println("+++++++++++++++++++++++++++++++++++++++++++");
	}
}
