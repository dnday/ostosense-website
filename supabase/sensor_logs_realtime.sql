-- Web dashboard subscribe ke perubahan sensor_logs lewat Supabase Realtime
-- (patient-workspace.tsx, patient-detail-modal.tsx: .channel(...).on('postgres_changes', ...)).
-- Tanpa tabel ini ada di publication supabase_realtime, event INSERT gak pernah
-- terkirim ke browser sama sekali — layar cuma nunjukin snapshot pas awal dibuka,
-- padahal device terus ngirim data baru tiap ~1 detik ke database.
alter publication supabase_realtime add table sensor_logs;
