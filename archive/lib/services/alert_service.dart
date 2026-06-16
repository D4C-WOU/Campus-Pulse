import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/alert_model.dart';

class AlertService {
  final CollectionReference alerts = FirebaseFirestore.instance.collection(
    'alerts',
  );

  static const int cooldownMinutes = 5;

  Future<void> createAlert({
    required String type,
    required String message,
    String? locationHint,
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    // 🛑 RATE LIMIT CHECK
    final recentAlerts = await alerts
        .where('reportedBy', isEqualTo: user.uid)
        .limit(1)
        .get();

    if (recentAlerts.docs.isNotEmpty) {
      final lastAlertTime = (recentAlerts.docs.first['createdAt'] as Timestamp)
          .toDate();

      final difference = DateTime.now().difference(lastAlertTime);

      if (difference.inMinutes < cooldownMinutes) {
        throw Exception(
          'Please wait ${cooldownMinutes - difference.inMinutes} minute(s) before reporting again.',
        );
      }
    }

    final docRef = alerts.doc();

    final alert = AlertModel(
      id: docRef.id,
      type: type,
      message: message,
      locationHint: locationHint?.isNotEmpty == true ? locationHint : null,
      reportedBy: user.uid,
      status: 'active',
      isFalseReport: false,
      createdAt: Timestamp.now(),
    );

    await docRef.set(alert.toMap());
  }

  // 🔴 ACTIVE ALERTS
  Stream<QuerySnapshot> streamActiveAlerts() {
    return alerts
        .where('status', isEqualTo: 'active')
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // 📋 ALL ALERTS
  Stream<QuerySnapshot> streamAllAlerts() {
    return alerts.orderBy('createdAt', descending: true).snapshots();
  }

  // 🟢 RESOLVED / FALSE ALERTS
  Stream<QuerySnapshot> streamResolvedAlerts() {
    return alerts
        .where('status', whereIn: ['resolved', 'false'])
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // ✅ RESOLVE ALERT
  Future<void> resolveAlert(String alertId, String adminUid) async {
    await alerts.doc(alertId).update({
      'status': 'resolved',
      'resolvedBy': adminUid,
      'resolvedAt': Timestamp.now(),
    });
  }

  // 🚫 FALSE REPORT
  Future<void> markFalseReport(String alertId, String adminUid) async {
    await alerts.doc(alertId).update({
      'status': 'false',
      'isFalseReport': true,
      'resolvedBy': adminUid,
      'resolvedAt': Timestamp.now(),
    });
  }
}
