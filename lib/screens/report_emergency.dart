import 'package:flutter/material.dart';
import '../services/alert_service.dart';

class ReportEmergency extends StatefulWidget {
  const ReportEmergency({super.key});

  @override
  State<ReportEmergency> createState() => _ReportEmergencyState();
}

class _ReportEmergencyState extends State<ReportEmergency> {
  final AlertService _alertService = AlertService();
  final _locationController = TextEditingController();
  final _messageController = TextEditingController();

  String selectedType = 'Fire';
  bool isSubmitting = false;

  Future<void> _submitAlert() async {
    setState(() => isSubmitting = true);

    try {
      await _alertService.createAlert(
        type: selectedType,
        message: _messageController.text.trim(),
        locationHint: _locationController.text.trim(),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('🚨 Emergency alert sent')));

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report Emergency')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning, color: Colors.red),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Use only for real emergencies.',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              initialValue: selectedType,
              items: const [
                DropdownMenuItem(value: 'Fire', child: Text('Fire')),
                DropdownMenuItem(value: 'Medical', child: Text('Medical')),
                DropdownMenuItem(value: 'Safety', child: Text('Safety')),
              ],
              onChanged: (v) => setState(() => selectedType = v!),
              decoration: const InputDecoration(labelText: 'Emergency Type'),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location (optional)',
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _messageController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Additional details',
              ),
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                ),
                onPressed: isSubmitting ? null : _submitAlert,
                child: isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'SEND EMERGENCY ALERT',
                        style: TextStyle(letterSpacing: 1),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
