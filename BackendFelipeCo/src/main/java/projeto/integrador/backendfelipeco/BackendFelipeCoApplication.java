package projeto.integrador.backendfelipeco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class BackendFelipeCoApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendFelipeCoApplication.class, args);
    }

}
