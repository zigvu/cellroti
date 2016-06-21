module States
  class Roles

    def initialize
    end

    def self.client_user_and_above(user)
    ((user.has_role? self.client_user) ||
      (user.has_role? self.client_admin) ||
      (user.has_role? self.zigvu_user) ||
      (user.has_role? self.zigvu_admin))
    end

    def self.client_admin_and_above(user)
    ((user.has_role? self.client_admin) ||
      (user.has_role? self.zigvu_user) ||
      (user.has_role? self.zigvu_admin))
    end

    def self.zigvu_user_and_above(user)
    ((user.has_role? self.zigvu_user) ||
      (user.has_role? self.zigvu_admin))
    end

    def self.zigvu_admin_and_above(user)
      user.has_role? self.zigvu_admin
    end

    def self.zigvu_admin
      return "zigvu_admin"
    end
    def self.zigvu_admin_pretty
      return "Zigvu Admin"
    end

    def self.zigvu_user
      return "zigvu_user"
    end
    def self.zigvu_user_pretty
      return "Zigvu User"
    end

    def self.client_admin
      return "client_admin"
    end
    def self.client_admin_pretty
      return "Admin"
    end

    def self.client_user
      return "client_user"
    end
    def self.client_user_pretty
      return "User"
    end

    def self.guest_user
      return "guest_user"
    end
    def self.guest_user_pretty
      return "Guest User"
    end

    def self.getPrettyName(role)
      self.send("#{role.name}_pretty")
    end

    def self.getClientRoles
      ::Role.where(name: [self.client_admin, self.client_user])
    end

  end
end
