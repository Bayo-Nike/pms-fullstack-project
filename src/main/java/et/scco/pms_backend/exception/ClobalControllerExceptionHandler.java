// package com.example.fullstackbook_todo_springboot.exception;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.ControllerAdvice;
// import org.springframework.web.bind.annotation.ExceptionHandler;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.server.ResponseStatusException;

// import com.example.fullstackbook_todo_springboot.dto.ErrorDto;

// import lombok.extern.log4j.Log4j2;

// @ControllerAdvice(annotations = RestController.class)
// @Log4j2
// public class ClobalControllerExceptionHandler {

//     @ExceptionHandler(ResponseStatusException.class)
//     public ResponseEntity<ErrorDto>handleResponseStatusException(ResponseStatusException ex){
//         log.error("Response Status Exception",ex);
//         ErrorDto errorDto=new ErrorDto(ex.getMessage());
//         return new ResponseEntity<>(errorDto,ex.getStatusCode());

//     }

//     @ExceptionHandler(ToDoException.class)
//     public ResponseEntity<ErrorDto>handleToDoException(ToDoException ex){
//         log.error("to do custom exception",ex);
//         ErrorDto errorDto=new ErrorDto(ex.getMessage());
//         HttpStatus httpStatus=HttpStatus.resolve(ex.getStatus()); 
//         return new ResponseEntity<>(errorDto,httpStatus);

//     }

//     @ExceptionHandler(RuntimeException.class)
//     public ResponseEntity<ErrorDto>handleRuntimeException(RuntimeException ex){
//         log.error("Internal Server Error",ex);
//         ErrorDto errorDto=new ErrorDto("Internal Server Error"); 
//         return new ResponseEntity<>(errorDto,HttpStatus.INTERNAL_SERVER_ERROR);

//     }

// }
