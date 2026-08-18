package com.saketh.talkloop.user;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document
public class User {
    @Id
    private String slug;
    private String fullName;
    @JsonIgnore
    private String password;
    private UserStatus userStatus;
}
