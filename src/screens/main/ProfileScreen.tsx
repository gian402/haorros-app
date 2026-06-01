import React, {useState, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  TextInput, Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuthStore} from '../../store/authStore';
import {useGoalsStore} from '../../store/goalsStore';
import {supabase} from '../../supabase/client';
import {extractError} from '../../services/extractError';
import {colors} from '../../theme/colors';

export function ProfileScreen() {
  const {session, signOut} = useAuthStore();
  const {goals} = useGoalsStore();
  const [nameModal, setNameModal] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const userId = session?.user.id ?? '';
  const name = session?.user.user_metadata?.name ?? 'Usuario';
  const email = session?.user.email ?? '';
  const initial = name[0]?.toUpperCase() ?? 'U';

  // Cargar avatar guardado en tabla users
  useEffect(() => {
    if (!userId) return;
    supabase.from('users').select('avatar_url').eq('id', userId).single()
      .then(({data}) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [userId]);

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);
  const completed = goals.filter(g => g.current_amount >= g.target_amount && g.target_amount > 0).length;

  const pickAvatar = async () => {
    const res = await launchImageLibrary({mediaType: 'photo', quality: 0.7});
    const uri = res.assets?.[0]?.uri;
    if (!uri || !userId) return;
    setUploadingAvatar(true);
    try {
      const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
      const path = `${userId}.${ext}`;
      const formData = new FormData();
      formData.append('file', {uri, name: `avatar.${ext}`, type: `image/${ext}`} as unknown as Blob);

      // Intentar crear el bucket si no existe
      await supabase.storage.createBucket('avatars', {public: true}).catch(() => {/* ya existe */});

      const {error: upErr} = await supabase.storage
        .from('avatars')
        .upload(path, formData, {upsert: true});
      if (upErr) throw upErr;

      const {data: urlData} = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl + '?t=' + Date.now();

      // Guardar en tabla users para que otros la vean
      await supabase.from('users').upsert(
        {id: userId, avatar_url: urlData.publicUrl},
        {onConflict: 'id'}
      );
      setAvatarUrl(publicUrl);
    } catch (e: unknown) {
      Alert.alert('Error al subir foto', extractError(e));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const {error} = await supabase.auth.updateUser({data: {name: newName.trim()}});
    if (!error) await supabase.from('users').upsert({id: userId, name: newName.trim()}, {onConflict: 'id'});
    setSaving(false);
    if (error) {Alert.alert('Error', error.message); return;}
    Alert.alert('¡Listo!', 'Nombre actualizado');
    setNameModal(false);
  };

  const savePass = async () => {
    if (newPass.length < 8) {Alert.alert('Error', 'Mínimo 8 caracteres'); return;}
    setSaving(true);
    const {error} = await supabase.auth.updateUser({password: newPass});
    setSaving(false);
    if (error) {Alert.alert('Error', error.message); return;}
    Alert.alert('¡Listo!', 'Contraseña actualizada');
    setPassModal(false); setNewPass('');
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.content}>
      {/* Card perfil */}
      <View style={s.card}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} disabled={uploadingAvatar}>
          {avatarUrl ? (
            <Image source={{uri: avatarUrl}} style={s.avatar} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={s.cameraOverlay}>
            {uploadingAvatar
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={s.cameraIcon}>📷</Text>}
          </View>
        </TouchableOpacity>
        <Text style={s.name}>{name}</Text>
        <Text style={s.email}>{email}</Text>
      </View>

      {/* Estadísticas */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>S/ {totalSaved.toLocaleString()}</Text>
          <Text style={s.statLabel}>Total ahorrado</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{goals.length}</Text>
          <Text style={s.statLabel}>Metas activas</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>{completed}</Text>
          <Text style={s.statLabel}>Completadas</Text>
        </View>
      </View>

      {/* Opciones */}
      <View style={s.section}>
        <TouchableOpacity style={s.row} onPress={() => {setNewName(name); setNameModal(true);}}>
          <Text style={s.rowIcon}>✏️</Text>
          <Text style={s.rowLabel}>Cambiar nombre</Text>
          <Text style={s.rowArrow}>›</Text>
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity style={s.row} onPress={() => setPassModal(true)}>
          <Text style={s.rowIcon}>🔑</Text>
          <Text style={s.rowLabel}>Cambiar contraseña</Text>
          <Text style={s.rowArrow}>›</Text>
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity style={s.row} onPress={signOut}>
          <Text style={s.rowIcon}>🚪</Text>
          <Text style={[s.rowLabel, {color: colors.danger}]}>Cerrar sesión</Text>
          <Text style={s.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Modal nombre */}
      <Modal visible={nameModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Cambiar nombre</Text>
            <TextInput style={s.sheetInput} value={newName} onChangeText={setNewName}
              placeholder="Tu nombre" placeholderTextColor={colors.gray3} />
            {saving
              ? <ActivityIndicator color={colors.primary} />
              : <TouchableOpacity style={s.saveBtn} onPress={saveName}><Text style={s.saveBtnText}>Guardar</Text></TouchableOpacity>}
            <TouchableOpacity style={s.cancel} onPress={() => setNameModal(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal contraseña */}
      <Modal visible={passModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Nueva contraseña</Text>
            <TextInput style={s.sheetInput} value={newPass} onChangeText={setNewPass}
              placeholder="Mínimo 8 caracteres" placeholderTextColor={colors.gray3} secureTextEntry />
            {saving
              ? <ActivityIndicator color={colors.primary} />
              : <TouchableOpacity style={s.saveBtn} onPress={savePass}><Text style={s.saveBtnText}>Guardar</Text></TouchableOpacity>}
            <TouchableOpacity style={s.cancel} onPress={() => setPassModal(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  content: {padding: 16, paddingBottom: 40},
  card: {
    backgroundColor: colors.card, borderRadius: 24, padding: 24,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: {color: '#000', fontSize: 34, fontWeight: '800'},
  cameraOverlay: {
    position: 'absolute', bottom: 12, right: -4,
    backgroundColor: colors.surface, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  cameraIcon: {fontSize: 14},
  name: {color: colors.white, fontSize: 20, fontWeight: '700'},
  email: {color: colors.gray2, fontSize: 13, marginTop: 4},
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16, padding: 16,
  },
  statBox: {flex: 1, alignItems: 'center'},
  statValue: {color: colors.primary, fontSize: 20, fontWeight: '800'},
  statLabel: {color: colors.gray2, fontSize: 11, marginTop: 4, textAlign: 'center'},
  statDivider: {width: 1, backgroundColor: colors.border},
  section: {backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden'},
  row: {flexDirection: 'row', alignItems: 'center', padding: 16},
  rowIcon: {fontSize: 20, marginRight: 12},
  rowLabel: {flex: 1, color: colors.white, fontSize: 15, fontWeight: '600'},
  rowArrow: {color: colors.gray2, fontSize: 22},
  divider: {height: 1, backgroundColor: colors.border, marginLeft: 52},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)'},
  sheet: {backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24},
  sheetTitle: {color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 16},
  sheetInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 16, marginBottom: 16,
  },
  saveBtn: {backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center'},
  saveBtnText: {color: '#000', fontWeight: '700', fontSize: 16},
  cancel: {marginTop: 12, alignItems: 'center'},
  cancelText: {color: colors.gray2, fontSize: 15},
});
