import 'package:flutter/material.dart';
import '../auth/auth_service.dart';
import '../auth/admin_login.dart';
import 'user_home.dart';

class RoleSelectorPage extends StatelessWidget {
  RoleSelectorPage({super.key});

  final AuthService _authService = AuthService();

  Future<void> _enterAsUser(BuildContext context) async {
    await _authService.signInAnonymously();

    if (!context.mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const UserHome()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.warning_amber_rounded,
              size: 72,
              color: Colors.redAccent,
            ),

            const SizedBox(height: 16),

            const Text(
              'Campus Pulse',
              style: TextStyle(fontSize: 34, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 8),

            const Text(
              'Instant campus emergency alerts',
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 48),

            // 🔴 USER BUTTON (PRIMARY)
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.person),
                label: const Text('I am a User'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _enterAsUser(context),
              ),
            ),

            const SizedBox(height: 16),

            // ⚫ ADMIN BUTTON (SECONDARY)
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.admin_panel_settings),
                label: const Text('Admin Login'),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AdminLoginPage()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
