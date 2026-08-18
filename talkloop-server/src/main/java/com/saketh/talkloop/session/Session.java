package com.saketh.talkloop.session;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@Document(collection = "sessions")
public class Session {
    @Id
    private String id;
    private String username;
    @Indexed(expireAfter = "0s")
    private Date expiresAt;

    protected Session() {
    }

    public Session(String id, String username, long expiresAtMillis) {
        this.id = id;
        this.username = username;
        this.expiresAt = new Date(expiresAtMillis);
    }
}