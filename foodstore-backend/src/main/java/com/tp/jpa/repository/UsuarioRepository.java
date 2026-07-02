package com.tp.jpa.repository;

import com.tp.jpa.model.Usuario;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    // Consulta JPQL: busca un usuario activo por su dirección de correo electrónico
    // Retorna Optional para manejar el caso en que el mail no esté registrado
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u " +
                    "WHERE u.mail = :mail AND u.eliminado = false";
            List<Usuario> resultado = em.createQuery(jpql, Usuario.class)
                    .setParameter("mail", mail)
                    .getResultList();
            return resultado.isEmpty() ? Optional.empty() : Optional.of(resultado.get(0));
        } finally {
            em.close();
        }
    }
}
