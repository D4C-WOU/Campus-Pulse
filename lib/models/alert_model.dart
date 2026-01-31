import 'package:cloud_firestore/cloud_firestore.dart';

class AlertModel {
  final String id;
  final String type;
  final String message;
  final String? locationHint; // 👈 NEW
  final String reportedBy;
  final String status;
  final bool isFalseReport;
  final Timestamp createdAt;

  AlertModel({
    required this.id,
    required this.type,
    required this.message,
    this.locationHint, // 👈 NEW
    required this.reportedBy,
    required this.status,
    required this.isFalseReport,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type,
      'message': message,
      'locationHint': locationHint, // 👈 NEW
      'reportedBy': reportedBy,
      'status': status,
      'isFalseReport': isFalseReport,
      'createdAt': createdAt,
    };
  }
}
