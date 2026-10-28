import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';

const Avatar = React.memo(({ name, avatarUrl, size = 11 }) => {
  const sizeClass = `w-${size} h-${size}`;
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} className={`${sizeClass} rounded-full`} />;
  }
  return (
    <View className={`${sizeClass} rounded-full bg-primary/10 items-center justify-center`}>
      <Text className="font-black text-primary text-base">{(name || '?').charAt(0).toUpperCase()}</Text>
    </View>
  );
});

const AthleteRow = React.memo(({ athlete, isAssigned, onToggle, toggling }) => (
  <View className="flex-row items-center gap-3 bg-white dark:bg-slate-900/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
    <Avatar name={athlete.full_name} avatarUrl={athlete.avatar_url} />
    <View className="flex-1">
      <Text className="font-semibold text-slate-900 dark:text-slate-100" numberOfLines={1}>
        {athlete.full_name || 'Sin nombre'}
      </Text>
      <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
        ID: {athlete.id.slice(0, 8).toUpperCase()}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => onToggle(athlete, isAssigned)}
      disabled={toggling}
      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg ${
        isAssigned
          ? 'bg-rose-100 dark:bg-rose-900/30'
          : 'bg-primary/10 dark:bg-primary/20'
      }`}
    >
      {toggling ? (
        <ActivityIndicator size="small" color={isAssigned ? '#f43f5e' : '#007fff'} />
      ) : (
        <>
          <MaterialIcons
            name={isAssigned ? 'person-remove' : 'person-add'}
            size={16}
            color={isAssigned ? '#f43f5e' : '#007fff'}
          />
          <Text
            className={`text-xs font-bold ${isAssigned ? 'text-rose-500' : 'text-primary'}`}
          >
            {isAssigned ? 'Quitar' : 'Asignar'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  </View>
));

export default function AssignAthletesScreen() {
  const navigation = useNavigation();
  const { session } = useAuthStore();
  const coachId = session?.user?.id;

  const [allAthletes, setAllAthletes] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [coachId]);

  const loadData = async () => {
    if (!coachId) { setLoading(false); return; }

    try {
      setLoading(true);
      const [{ data: athletes, error: athletesError }, { data: assignments, error: assignError }] =
        await Promise.all([
          supabase
            .from('users')
            .select('id, full_name, avatar_url, role')
            .in('role', ['athlete', 'atleta'])
            .order('full_name', { ascending: true }),
          supabase
            .from('coach_athlete_assignments')
            .select('athlete_id')
            .eq('coach_id', coachId)
            .eq('is_active', true),
        ]);

      if (athletesError) throw athletesError;
      if (assignError) throw assignError;

      setAllAthletes(athletes || []);
      setAssignedIds(new Set((assignments || []).map((a) => a.athlete_id)));
    } catch (error) {
      Alert.alert('Error al cargar atletas', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = useCallback(async (athlete, isAssigned) => {
    if (!coachId || togglingId) return;

    try {
      setTogglingId(athlete.id);

      if (isAssigned) {
        const { error } = await supabase
          .from('coach_athlete_assignments')
          .update({
            is_active: false,
            unassigned_at: new Date().toISOString(),
          })
          .eq('coach_id', coachId)
          .eq('athlete_id', athlete.id)
          .eq('is_active', true);

        if (error) throw error;

        setAssignedIds((prev) => {
          const next = new Set(prev);
          next.delete(athlete.id);
          return next;
        });
      } else {
        // Upsert usando el UNIQUE(coach_id, athlete_id) añadido en la migración
        const { error } = await supabase
          .from('coach_athlete_assignments')
          .upsert(
            {
              coach_id: coachId,
              athlete_id: athlete.id,
              is_active: true,
              assigned_at: new Date().toISOString(),
              unassigned_at: null,
            },
            { onConflict: 'coach_id,athlete_id' }
          );

        if (error) throw error;

        setAssignedIds((prev) => new Set([...prev, athlete.id]));
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setTogglingId(null);
    }
  }, [coachId, togglingId]);

  const filteredAthletes = useMemo(() => {
    if (!search.trim()) return allAthletes;
    const query = search.toLowerCase();
    return allAthletes.filter((a) =>
      (a.full_name || '').toLowerCase().includes(query)
    );
  }, [allAthletes, search]);

  const assignedCount = assignedIds.size;

  const renderItem = useCallback(({ item }) => {
    const isAssigned = assignedIds.has(item.id);
    return (
      <AthleteRow
        athlete={item}
        isAssigned={isAssigned}
        onToggle={handleToggle}
        toggling={togglingId === item.id}
      />
    );
  }, [assignedIds, handleToggle, togglingId]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#007fff" />
        <Text className="mt-4 text-slate-500 font-semibold">Cargando atletas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 -ml-1">
          <MaterialIcons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Gestionar atletas
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {assignedCount} asignado{assignedCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={loadData} className="p-2">
          <MaterialIcons name="refresh" size={22} color="#007fff" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-background-light dark:bg-background-dark">
        <View className="flex-row items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <MaterialIcons name="search" size={18} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar atleta..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-slate-900 dark:text-slate-100 text-sm"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary chips */}
      <View className="flex-row gap-3 px-4 py-3">
        <View className="bg-primary/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5">
          <MaterialIcons name="person-add" size={14} color="#007fff" />
          <Text className="text-primary text-xs font-bold">
            {assignedCount} asignados
          </Text>
        </View>
        <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5">
          <MaterialIcons name="group" size={14} color="#64748b" />
          <Text className="text-slate-500 text-xs font-bold">
            {allAthletes.length} total
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredAthletes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: 68, offset: 68 * index, index })}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-8">
            <MaterialIcons name="person-search" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 font-semibold text-center mt-4">
              {search ? 'Ningún atleta coincide con la búsqueda' : 'No hay atletas registrados aún'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
      />
    </SafeAreaView>
  );
}
