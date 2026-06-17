import java.sql.*;

public class AssignShop {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "81961";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Assigning Shop 2 to user 'hassan'...");
            int rows = stmt.executeUpdate("UPDATE users SET shop_id = '2' WHERE username = 'hassan'");
            System.out.println("Rows updated: " + rows);
            
            ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE username = 'hassan'");
            if (rs.next()) {
                System.out.println("User: " + rs.getString("username") + ", Shop ID: " + rs.getString("shop_id"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
